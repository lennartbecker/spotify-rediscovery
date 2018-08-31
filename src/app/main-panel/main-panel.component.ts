import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { AuthorizeService } from '../authorize.service';
import { SpotifyService } from '../spotify.service';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {
  user: string;
  userLanguage;
  test;
  to;
  from;
  toObj = {
    year: null,
    month: null,
    day: null
  };
  fromObj = {
    year: null,
    month: null,
    day: null
  };
  extraSettings: boolean = false;
  playlistNames: any[] = []; // array of playlist names&ids of the current user
  filteredTracks = []
  filteredTracksUris = []; //vielleicht noch entfernen, wird für playlisterstellung genutzt
  showTracks: boolean = false;
  playlists = {};
  playlistsToIgnore: string[] = [];
  showSpinner: boolean = true;

  constructor(private auth: AuthorizeService, private spotify: SpotifyService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.startLoading()
  }

  async startLoading() {
    await this.getUserData()

    this.playlistNames = await this.getPlayLists()
    this.playlistNames = this.filterForUsersPlaylists(this.playlistNames) //Filter Out playlists that the user follows

    for (let i = 0; i < this.playlistNames.length; i++) {
      let playlist = this.playlistNames[i]
      await this.getTracks(playlist.tracks.href, playlist.id, playlist.name)
    }
    this.showSpinner = false;
  }

  async getUserData() {
    try {
      let token = this.getAccessToken()
      let userdata: any = await this.spotify.getUserData()
      this.user = userdata.id;
    } catch {
      console.log("Error ")

    }
  }

  async getPlayLists(offset = 0, limit = 20, prevPlaylists = []) { //Get all playlists from current user
    let token = this.getAccessToken();
    let playlist: any = await this.spotify.getPlaylists(offset, limit)
    prevPlaylists.push(...playlist.items)
    if (playlist.next) {
      offset = +20
      return this.getPlayLists(offset, limit, prevPlaylists)
    } else {
      return prevPlaylists
    }
  }

  filterForUsersPlaylists(playlist: any) { //Add user-created playlist ids to playlist array
    let filteredPlaylists = []
    playlist.forEach(playlist => {
      if (playlist.owner.id == this.user && !playlist.collaborative) {
        filteredPlaylists.push(playlist);
      }
    });
    return filteredPlaylists;
  }

  async getTracks(url, id, name) {
    let token = this.getAccessToken()
    let data: any = await this.spotify.getTracks(url)
    data.items.forEach(track => {
      track.playlist = { id, name }
    });
    this.saveToTracksObject(id, data);

    if (data.next) {
      this.getTracks(data.next, id, name)
    }
  }
  private saveToTracksObject(id: any, data: any) {
    if (this.playlists[id]) {
      this.playlists[id].push(...data.items);
    }
    else {
      this.playlists[id] = data.items;
    }
  }
  getAccessToken() {
    let token = this.auth.getAccessToken()
    return token
  }

  runFilter() {
    if (Date.parse(this.to) < Date.parse(this.from)) {

    }
    if (this.to == '' || !this.to || this.from == '' || !this.from) {
      this.snackBar.open("Please select a timeframe!")
    } else {

      if (Date.parse(this.to) < Date.parse(this.from)) {
        let placeholder = this.from;
        this.from = this.to;
        this.to = placeholder;
      }

      this.showTracks = true;
      this.filteredTracks = []
      let toDate = Date.parse(this.to)
      let fromDate = Date.parse(this.from)
      for (const playlist in this.playlists) {

        if (this.playlistsToIgnore.indexOf(playlist) == -1) {
          this.playlists[playlist].forEach(track => {

            let date = Date.parse(track.added_at)

            if (date > fromDate && date < toDate) {
              this.insertTrack(track, date);
            }

          });

        }
      }
      this.filteredTracks.sort(function (a, b) {
        return Date.parse(a.added_at) - Date.parse(b.added_at)
      })
    }
  }


  private insertTrack(track: any, date: number) {
    if (!track.is_local) {
      let index = this.filteredTracks.map((mytrack) => mytrack.track.id).indexOf(track.track.id); //determine if track already exists in filteredTracks
      if (index == -1) {
        this.filteredTracks.push(track);
      }
      else {
        let currentTrackAdded = Date.parse(this.filteredTracks[index].added_at); //if track was added to playlist before the one currently in the filteredTracks Object, add the older one
        if (currentTrackAdded > date) {
          this.filteredTracks[index] = track;
        }
      }
    }
  }
  async createPlaylist() {
    let token = this.getAccessToken()
    this.getDateSpan()
    let name;
    if (this.to != '' || this.from != '') {
      if (this.fromObj.year == this.toObj.year) {
        name = `${this.fromObj.month} ${this.fromObj.day} - ${this.toObj.month} ${this.toObj.day} ${this.toObj.year}`
      } else {
        name = `${this.fromObj.day} ${this.fromObj.month} ${this.fromObj.year} -  ${this.toObj.day} ${this.toObj.month} ${this.toObj.year}`
      }
      let playlist = await this.spotify.createPlaylist(name, "Created with Rediscovery", this.user)
      this.addTracksToPlaylist(playlist['id'])
    } else {
      console.log('no timeframe specified')
    }
  }
  async addTracksToPlaylist(id) {
    this.filteredTracksUris = []
    for (let i = 0; i < this.filteredTracks.length; i++) {
      this.filteredTracksUris.push("spotify:track:" + this.filteredTracks[i].track.id)
    }
    await this.spotify.insertTracks(this.user, id, this.filteredTracksUris)
    this.snackBar.open('Playlist creation successfull');
  }

  getDateSpan() {
    let fromDate = new Date(this.from)
    let toDate = new Date(this.to)
    let locale = "en-us"

    this.fromObj.month = fromDate.toLocaleString(locale, { month: "long" })
    this.fromObj.day = fromDate.getDate()
    this.fromObj.year = fromDate.getFullYear()

    this.toObj.month = toDate.toLocaleString(locale, { month: "long" })
    this.toObj.day = toDate.getDate()
    this.toObj.year = toDate.getFullYear()
  }
  toggleExtraSettings() {
    console.log("click")
    this.extraSettings = !this.extraSettings;
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthorizeService } from '../authorize.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  constructor(private auth: AuthorizeService, private spotify: SpotifyService) { }

  ngOnInit() {
    this.startLoading()
  }
  user: string;
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
  playlists: any[] = [];
  filteredTracks = []
  filteredTracksUris = [];
  showTracks: boolean = false;
  tracks = {};
  async startLoading() {
    await this.getUserData()
    this.playlists = await this.getPlayLists()
    this.playlists = this.filterForUsersPlaylists(this.playlists)

    for (let i = 0; i < this.playlists.length; i++) {
      let playlist = this.playlists[i]
      await this.getTracks(playlist.tracks.href, playlist.id, playlist.name)
    }
  }

  async getUserData() {
    let token = this.getAccessToken()
    let userdata: any = await this.spotify.getUserData(token)
    this.user = userdata.id;
  }

  async getPlayLists(offset = 0, limit = 20, prevPlaylists = []) { //Get all playlists from current user
    let token = this.getAccessToken();
    let playlist: any = await this.spotify.getPlaylists(token, offset, limit)
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
    let data: any = await this.spotify.getTracks(url, token)
    data.items.forEach(track => {
      track.playlist = { id, name }
    });
    this.saveToTracksObject(id, data);

    if (data.next) {
      this.getTracks(data.next, id, name)
    }
  }
  private saveToTracksObject(id: any, data: any) {
    if (this.tracks[id]) {
      this.tracks[id].push(...data.items);
    }
    else {
      this.tracks[id] = data.items;
    }
  }
  getAccessToken() {
    let token = this.auth.getAccessToken()
    return token
  }

  filterByDate() {
    this.showTracks = true;
    this.filteredTracks = []
    for (const playlist in this.tracks) {
      this.tracks[playlist].forEach(track => {
        track.album = playlist
        let date = Date.parse(track.added_at)
        let toDate = Date.parse(this.to)
        let fromDate = Date.parse(this.from)
        if (date > fromDate && date < toDate) {
          this.insertTrack(track, date);
        }
      });
    }
    console.log(this.filteredTracks)
    this.filteredTracks.sort(function (a, b) {
      return Date.parse(a.added_at) - Date.parse(b.added_at)
    })
  }


  private insertTrack(track: any, date: number) {
    if (!track.is_local) {
      let index = this.filteredTracks.map((mytrack) => mytrack.track.id).indexOf(track.track.id);
      if (index == -1) {
        this.filteredTracks.push(track);
      }
      else {
        let currentTrackAdded = Date.parse(this.filteredTracks[index].added_at);
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
    if (this.fromObj.year == this.toObj.year) {
      name = `${this.fromObj.month} ${this.fromObj.day} - ${this.toObj.month} ${this.toObj.day} ${this.toObj.year}`
    } else {
      name = `${this.fromObj.day} ${this.fromObj.month} ${this.fromObj.year} -  ${this.toObj.day} ${this.toObj.month} ${this.toObj.year}`
    }
    console.log(name)
    let playlist = await this.spotify.createPlaylist(name, "Created with Rediscovery", this.user, token)
    this.addTracksToPlaylist(playlist['id'])
  }
  async addTracksToPlaylist(id){
    this.filteredTracksUris = []
    for (let i = 0; i < this.filteredTracks.length; i++) {
      this.filteredTracksUris.push("spotify:track:"+this.filteredTracks[i].track.id)
    }
    await this.spotify.insertTracks(this.user,id,this.filteredTracksUris,this.getAccessToken())
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
    console.log(this.fromObj,this.toObj)
  }
}

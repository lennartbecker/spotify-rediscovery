import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { AuthorizeService } from '../authorize.service';
import { SpotifyService } from '../spotify.service';
import { MatSnackBar } from '@angular/material';
import {SlicePipe} from '@angular/common'
@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  user: string; //User Id
  to: string; //NgModel for dateinput, used to specify the timeframe
  from: string;//NgModel for dateinput, used to specify the timeframe

  extraSettings: boolean = false; //Show or hide extraSettings panel (exclude Playlists)
  showTracks: boolean = false; //Show or hide tracks depending on the status of the search
  showSpinner: boolean = true;

  preview = new Audio();
  currentlyPlaying: string = '';

  toObj = {  //Object of the to-Date specified. Used for the playlist naming (e.G. January 27 - February 8 2018)
    year: null,
    month: null,
    day: null
  };
  fromObj = {  //Object of the from-Date specified. Used for the playlist naming (e.G. January 27 - February 8 2018)
    year: null,
    month: null,
    day: null
  };
  playlists = {};

  playlistNames: any[] = []; // array of playlist names&ids of the current user
  filteredTracks = []
  filteredTracksUris = []; //vielleicht noch entfernen, wird für playlisterstellung genutzt
  playlistsToIgnore: string[] = [];

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
    let userdata: any = await this.spotify.getUserData()
    this.user = userdata.id;
  }

  async getPlayLists(offset = 0, limit = 20, prevPlaylists = []) { //Get all playlists from current user
    let playlist: any = await this.spotify.getPlaylists(offset, limit)
    prevPlaylists.push(...playlist.items)
    if (playlist.next) {
      offset += 20;
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

  async getTracks(url, id, name) { //Get tracks of the specified playlist, id is the spotify playlist id
    let data: any = await this.spotify.getTracks(url)
    data.items.forEach(track => { //Add playlist info to each track for displaying it on the cards
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
  runFilter() {
    if (this.to == '' || !this.to || this.from == '' || !this.from) {
      this.snackBar.open("Please select a timeframe!", '', {
        duration: 3000
      })
    } else {

      if (Date.parse(this.to) < Date.parse(this.from)) {
        let placeholder = this.from;
        this.from = this.to;
        this.to = placeholder;
      }

      this.filteredTracks = []

      let toDate = new Date(this.to).setHours(23, 59, 59);
      let fromDate = new Date(this.from).setHours(0, 0, 0);


      for (const playlist in this.playlists) {

        if (this.playlistsToIgnore.indexOf(playlist) == -1) {
          this.playlists[playlist].forEach(track => {
            let date = Date.parse(track.added_at)
            if (date >= fromDate && date <= toDate) {
              this.insertTrack(track, date);
            }
          });

        }
      }

      this.filteredTracks.sort(function (a, b) {
        return Date.parse(a.added_at) - Date.parse(b.added_at)
      })

      if (this.filteredTracks.length == 0) {
        this.showTracks = false;
        this.snackBar.open('Sorry, you added no tracks during that time. Maybe try a different one?', '', {
          duration: 3000
        })
      } else {
        this.showTracks = true;
      }
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
    this.getDateSpan()
    let name;
    if (this.to != '' || this.from != '') {
      if (this.fromObj.year == this.toObj.year) {
        name = `${this.fromObj.month} ${this.fromObj.day} - ${this.toObj.month} ${this.toObj.day} ${this.toObj.year}`
      } else {
        name = `${this.fromObj.day} ${this.fromObj.month} ${this.fromObj.year} -  ${this.toObj.day} ${this.toObj.month} ${this.toObj.year}`
      }

      let playlist = await this.spotify.createPlaylist(name, "Created with Rediscovery: https://rediscovery.lennart.cc", this.user) //Returns Id of the created Playlist

      this.addTracksToPlaylist(playlist['id'])
    }
  }
  async addTracksToPlaylist(id) {   //Get All Tracks the user filtered and use the uris to add the tracks to the created playlist
    this.filteredTracksUris = [] //todo:change to variable in scope
    for (let i = 0; i < this.filteredTracks.length; i++) {
      this.filteredTracksUris.push("spotify:track:" + this.filteredTracks[i].track.id)
    }
    if (this.filteredTracksUris.length >= 100) {

      while (this.filteredTracksUris.length != 0) {
        let partOfTracks = this.filteredTracksUris.slice(0, 99);
        this.filteredTracksUris = this.filteredTracksUris.slice(99, this.filteredTracksUris.length);
        await this.spotify.insertTracks(this.user, id, partOfTracks)
      }
    } else {
      await this.spotify.insertTracks(this.user, id, this.filteredTracksUris)
    }
    this.snackBar.open('Playlist creation successfull', 'Gotcha!', {
      duration: 3000
    });
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
    this.extraSettings = !this.extraSettings;
  }
  play(track) {
    if (this.preview.src != track.track.preview_url) {
      this.preview.src = track.track.preview_url;
      this.preview.load();
      this.preview.play();
      this.currentlyPlaying = track.track.preview_url;
    } else {
      if (this.currentlyPlaying) {
        this.preview.pause()
        this.currentlyPlaying = ''
      } else {
        this.preview.play();
        this.currentlyPlaying = track.track.preview_url;
      }
    }
  }
}

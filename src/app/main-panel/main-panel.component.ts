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
  playlists: any[] = [];
  filteredTracks = []
  tracks = {};
  async startLoading() {
    await this.getUserData()
    this.playlists = await this.getPlayLists()
    this.playlists = this.filterForUsersPlaylists(this.playlists)
    for (let i = 0; i < this.playlists.length; i++) {
      let playlist = this.playlists[i]
      await this.getTracks(playlist.tracks.href, playlist.id,playlist.name) 
    }
    console.log(this.tracks)
  }

  async getUserData() {
    let token = this.getAccessToken()
    let userdata: any = await this.spotify.getUserData(token)
    this.user = userdata.id;
  }

  async getPlayLists(offset = 0, limit = 20,prevPlaylists = []) {
    let token = this.getAccessToken();
    let playlist: any = await this.spotify.getPlaylists(token, offset, limit)
    prevPlaylists.push(...playlist.items)
    if (playlist.next) {
      offset = +20
      return this.getPlayLists(offset, limit,prevPlaylists)
    } else {
      return prevPlaylists
    }
  }
  filterForUsersPlaylists(playlist: any) {
    let filteredPlaylists = []
    playlist.forEach(playlist => {
      if (playlist.owner.id == this.user && !playlist.collaborative) {
        filteredPlaylists.push(playlist);
      }
    });
    return filteredPlaylists;
  }

  async getTracks(url,id,name) {
    let token = this.getAccessToken()
    let data: any = await this.spotify.getTracks(url, token)
    data.items.forEach(track => {
      track.playlist = {id,name}
    });
    this.saveToTracksObject(id, data);

    if (data.next) {
      this.getTracks(data.next,id,name)
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


    this.filteredTracks = []
    for (const playlist in this.tracks) {
      this.tracks[playlist].forEach(track => {
        track.album = playlist
        let date = Date.parse(track.added_at)
        let toDate = Date.parse(this.to)
        let fromDate = Date.parse(this.from)
        console.log(track)

        if (date > fromDate && date < toDate) {
          this.filteredTracks.push(track)
        }
      });
    }
  }
}

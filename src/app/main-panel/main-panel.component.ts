import { Component, OnInit } from '@angular/core';
import { AuthorizeService } from '../authorize.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  constructor(private auth:AuthorizeService,private spotify:SpotifyService) { }

  ngOnInit() {
    //  this.startLoading()
  }
  user: string;
  to;
  from;
  playlists: any[] = [];
  filteredTracks = []
  playlistTracks = {};

  async startLoading() {
    await this.getUserData()
    await this.getPlayLists()
    for (let i = 0; i < this.playlists.length; i++) {
      let playlist = this.playlists[i]
      await this.getTracks(playlist.tracks.href, playlist.id)
    }
    console.log(this.playlistTracks)
  }

  async getUserData() {
    let token = this.getAccessToken()
    let userdata: any = await this.spotify.getUserData(token)
    this.user = userdata.id;
  }

  async getPlayLists(offset = 0, limit = 20) {
    let token = this.getAccessToken()
    let playlist: any = await this.spotify.getPlaylists(token, offset, limit)

    if (playlist.next) {
      offset = +20
      this.getPlayLists(offset, limit)
    }

    this.getUsersPlaylists(playlist);
    console.log(this.playlists)
  }
  private getUsersPlaylists(playlist: any) {
    playlist.items.forEach(playlist => {
      if (playlist.owner.id == this.user && !playlist.collaborative) {
        this.playlists.push(playlist);
      }
    });
  }

  async getTracks(url, id) {
    let token = this.getAccessToken()
    let data: any = await this.spotify.getTracks(url, token)

    this.saveToTracksObject(id, data);

    if (data.next) {
      this.getTracks(data.next, id)
    }
  }
  private saveToTracksObject(id: any, data: any) {
    if (this.playlistTracks[id]) {
      this.playlistTracks[id].push(...data.items);
    }
    else {
      this.playlistTracks[id] = data.items;
    }
  }

  getAccessToken() {
    let token = this.auth.getAccessToken()
    return token
  }

  filterByDate() {
    this.filteredTracks = []
    for (const playlist in this.playlistTracks) {
      this.playlistTracks[playlist].forEach(track => {

        let date = Date.parse(track.added_at)
        let toDate = Date.parse(this.to)
        let fromDate = Date.parse(this.from)

        if (date > fromDate && date < toDate) {
          this.filteredTracks.push(track.track.name)
        }
      });
    }
  }
}

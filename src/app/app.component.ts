import { Component } from '@angular/core';
import { AuthorizeService } from './authorize.service';
import { SpotifyService } from './spotify.service';

interface data {
  items: string[];
  length;
  next;
  tracks;
}
interface track {
  tracks: {
    next: string;
    items: object[]
  };
  next: string;
  offset: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthorizeService]
})
export class AppComponent {
  constructor(private auth: AuthorizeService, private spotify: SpotifyService) { }
  user: string;
  temptracks;
  playlists: any[] = [];
  playlistTracks = {};
  clientid = '0224b8e36c9f4b698876dc79b4b88fe7'
  callback = 'http%3A%2F%2Flocalhost%3A4200%2Fcallback'
  url = `https://accounts.spotify.com/authorize?client_id=` + this.clientid + `&redirect_uri=` + this.callback + `&scope=user-read-private%20user-read-email&response_type=token`
  async startLoading() {
    await this.getUserData()
    await this.getPlayLists()
    for (let i = 0; i < this.playlists.length; i++) {
      let playlist = this.playlists[i]
      await this.getTracks(playlist.tracks.href, playlist.id)
    }
    console.log(this.playlistTracks)
    this.filterByDate("test")
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
    playlist.items.forEach(playlist => {
      if (playlist.owner.id == this.user && !playlist.collaborative) {
        this.playlists.push(playlist)
      }

    });
    console.log(this.playlists)
  }
  async getTracks(url, id) {
    let token = this.getAccessToken()
    let data: any = await this.spotify.getTracks(url, token)
    if (this.playlistTracks[id]) {
      this.playlistTracks[id].push(...data.items)
    } else {
      this.playlistTracks[id] = data.items
    }
    if (data.next) {
      this.getTracks(data.next, id)
    }
  }
  getAccessToken() {
    let token = this.auth.getAccessToken()
    return token
  }
  filterByDate(playlists) {
    for (const playlist in this.playlistTracks) {
      this.playlistTracks[playlist].forEach(track => {
        let date = Date.parse(track.added_at)
        let to = Date.parse('2018-03-01T07:58:10Z')
        let from = Date.parse('2018-01-01T07:58:10Z')
        if(date > from && date < to) {
          console.log(track.track.name)
        }
      });
    }
      
  }
} 

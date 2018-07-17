import { Component } from '@angular/core';
import { AuthorizeService } from './authorize.service';
import { SpotifyService } from './spotify.service';

interface data {
  items: string[];
  length;
  next;
  tracks;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthorizeService]
})
export class AppComponent {
  constructor(private auth: AuthorizeService, private spotify: SpotifyService) { }
  playlists: {};
  clientid = '0224b8e36c9f4b698876dc79b4b88fe7'
  callback = 'http%3A%2F%2Flocalhost%3A4200%2Fcallback'
  url = `https://accounts.spotify.com/authorize?client_id=` + this.clientid + `&redirect_uri=` + this.callback + `&scope=user-read-private%20user-read-email&response_type=token`
  tracks;
  async startLoading() {
    let test = await this.getPlayLists()
    console.log("danach")
    console.log(this.playlists)
  }
  getUserData() {
    let token = this.getAccessToken()
    this.spotify.getUserData(token)
      .subscribe(data => console.log(data))
  }
  async getPlayLists() {
    let token = this.getAccessToken()
    let playlists:any = await this.spotify.getPlaylists(token)
    this.playlists = playlists.items;
  }
  getTracks(url) {
    let token = this.getAccessToken()
    this.spotify.getTracks(token, url)
      .subscribe((data:data) => {
        let items = data.tracks.items
        // this.tracks.push({test:"test"})
        
        // console.log(data.tracks.items)
        let test = []
        this.tracks.push(...data.tracks.items)
        console.log("test",test)
        console.log(this.tracks)
      })
  }

  getAccessToken() {
    let token = this.auth.getAccessToken()
    return token
  }
} 

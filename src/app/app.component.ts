import { Component } from '@angular/core';
import { AuthorizeService } from './authorize.service';
import { SpotifyService } from './spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[AuthorizeService]
})
export class AppComponent {
  constructor(private auth:AuthorizeService,private spotify:SpotifyService) {}
  title = 'app';
  hallo = "test"
  clientid = '0224b8e36c9f4b698876dc79b4b88fe7'
  callback = 'http%3A%2F%2Flocalhost%3A4200%2Fcallback'
  url = `https://accounts.spotify.com/authorize?client_id=`+this.clientid+`&redirect_uri=`+this.callback+`&scope=user-read-private%20user-read-email&response_type=token`


  getUserData() {
    let token = this.getAccessToken()
    this.spotify.getUserData(token)
    .subscribe(data => console.log(data))
  }

  getAccessToken() {
    let token = this.auth.getAccessToken()
    return token
  }
} 

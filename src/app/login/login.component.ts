import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }
  clientid = '0224b8e36c9f4b698876dc79b4b88fe7'
  callback = 'http%3A%2F%2Flocalhost%3A4200%2Fcallback'
  url = `https://accounts.spotify.com/authorize?client_id=` + this.clientid + `&redirect_uri=` + this.callback + `&scope=user-read-private%20user-read-email&response_type=token`
  currentYear = new Date().getFullYear()
  ngOnInit() {
  }

}

import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  //Login Screen
  //builds the URL for the Login Prompt from Spotify
  constructor() {}
  clientid = "0224b8e36c9f4b698876dc79b4b88fe7";
  callback = environment.callbackUrl;
  url =
    `https://accounts.spotify.com/authorize?client_id=` +
    this.clientid +
    `&redirect_uri=` +
    this.callback +
    `&scope=user-read-private%20user-read-email%20playlist-modify-public%20playlist-modify-private%20user-library-read%20&response_type=token`;
  currentYear = new Date().getFullYear();


  ngOnInit() {}
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthorizeService } from './authorize.service';
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(private http:HttpClient,private auth:AuthorizeService) { }

  logAccessToken(token) {
    console.log(token)
  }
  getUserData(token) {
    return this.http.get('https://api.spotify.com/v1/me',{headers:{Authorization:'Bearer '+token}})
  }
}

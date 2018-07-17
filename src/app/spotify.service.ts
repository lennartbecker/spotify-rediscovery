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
   getPlaylists(token) {
    let data = this.http.get('https://api.spotify.com/v1/me/playlists',{headers:{Authorization:'Bearer '+token}}).toPromise()
    return data
  }
  getYellowTracks(token,url='https://api.spotify.com/v1/users/tw3ek/playlists/6kfBKFgsAPO3WgQdyqDsML/tracks') {
    return this.http.get(url,{headers:{Authorization:'Bearer '+token}})
  }
  getTracks(token,url) {
    return this.http.get(url,{headers:{Authorization:'Bearer '+token}})
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthorizeService } from './authorize.service';
@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  token:string;
  constructor(private http: HttpClient, private auth: AuthorizeService) {
    console.log("ngoninitspotifyservice")
    this.token = this.getAccesstoken();
   }

  getAccesstoken() {
    return this.auth.getAccessToken();
  }

  getUserData() {
    return this.http.get('https://api.spotify.com/v1/me', { headers: { Authorization: 'Bearer ' + this.token } }).toPromise()
  }
  getPlaylists(offset, limit) {
    let data = this.http.get('https://api.spotify.com/v1/me/playlists?offset=' + offset + '&limit=' + limit, { headers: { Authorization: 'Bearer ' + this.token } }).toPromise()
    data.catch((err) => console.log(err,'error detected'))
    return data
  }
  getTracks(url, offset = 0) {
    let params = { fields: "items(added_at,added_by,track(album,artists,id,href,uri,name))", offset }
    return this.http.get(url, { headers: { Authorization: 'Bearer ' + this.token } }).toPromise()
  }
  createPlaylist(name, description, user) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      })
    };
    let body = {
      name,
      description
    }
    return this.http.post('https://api.spotify.com/v1/users/' + user + '/playlists', body, httpOptions).toPromise()
  }
  insertTracks(user, playlist, tracks) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      })
    };
    let body = {
      uris:tracks
    }
    return this.http.post('https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist + '/tracks', body, httpOptions).toPromise()
  }
}

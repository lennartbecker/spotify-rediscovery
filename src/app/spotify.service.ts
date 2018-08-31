import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthorizeService } from './authorize.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  token: string;
  constructor(private http: HttpClient, private auth: AuthorizeService, public router: Router) {
  }

  getAccesstoken() {
    return this.auth.getAccessToken();
  }

  getUserData() {
    const token = this.getAccesstoken();
    return this.http.get('https://api.spotify.com/v1/me', { headers: { Authorization: 'Bearer ' + token } }).toPromise()
      .catch(() => this.router.navigate(['']))

  }
  getPlaylists(offset, limit) {
    const token = this.getAccesstoken();
    return this.http.get('https://api.spotify.com/v1/me/playlists?offset=' + offset + '&limit=' + limit, { headers: { Authorization: 'Bearer ' + token } }).toPromise()
      .catch(() => this.router.navigate(['']))
  }
  getTracks(url, offset = 0) {
    const token = this.getAccesstoken();
    let params = { fields: "items(added_at,added_by,track(album,artists,id,href,uri,name))", offset }
    return this.http.get(url, { headers: { Authorization: 'Bearer ' + token } }).toPromise()
      .catch(() => this.router.navigate(['']))

  }
  createPlaylist(name, description, user) {
    const token = this.getAccesstoken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
    let body = {
      name,
      description
    }
    return this.http.post('https://api.spotify.com/v1/users/' + user + '/playlists', body, httpOptions).toPromise()
  }
  insertTracks(user, playlist, tracks) {
    const token = this.getAccesstoken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
    let body = {
      uris: tracks
    }
    return this.http.post('https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist + '/tracks', body, httpOptions).toPromise()
  }
}

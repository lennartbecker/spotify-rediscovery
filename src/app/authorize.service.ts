import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeService {
  accesstoken;


  constructor(private http: HttpClient) {
  }
  getAccessToken() {
    if(localStorage.getItem('sr_accesstoken')){
      this.accesstoken = localStorage.getItem('sr_accesstoken')
    }
    return this.accesstoken
  }
  setAccessToken(token) {
    localStorage.setItem('sr_accesstoken',token)
    this.accesstoken = token;
  }
}

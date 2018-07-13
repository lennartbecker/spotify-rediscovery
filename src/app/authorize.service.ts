import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeService {
  accesstoken;


  constructor(private http:HttpClient) { 
  }
  getAccessToken() {
    return this.accesstoken
  }
   setAccessToken(token) {
    this.accesstoken = token;
   }
}

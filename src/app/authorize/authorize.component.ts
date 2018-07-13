import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizeService } from '../authorize.service';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.css']
})
export class AuthorizeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthorizeService) { }

  ngOnInit() {
    let urlParams = this.route.snapshot.fragment.split("&");
    this.auth.setAccessToken(urlParams[0].split("=")[1])

    this.router.navigate(['/main'])
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


/**
 * The view for the User Editor, allowing users to create other users
 * and view user information
 */
@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    let uuid = this.route.snapshot.params.id;
  }



}

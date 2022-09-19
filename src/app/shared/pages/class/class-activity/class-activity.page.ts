import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-class-activity',
  templateUrl: './class-activity.page.html',
  styleUrls: ['./class-activity.page.scss'],
})
export class ClassActivityPage {
  // -------------------------------------------------------------------------
  // Properties
  public classId: string;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private activatedRoute: ActivatedRoute) {
    this.classId = this.activatedRoute.snapshot.params['id'];
  }
}

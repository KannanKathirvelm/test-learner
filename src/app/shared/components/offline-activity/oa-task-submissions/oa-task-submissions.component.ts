import { Component, Input } from '@angular/core';
import { FILE, IMAGE } from '@shared/constants/helper-constants';
import { TaskModel } from '@shared/models/offline-activity/offline-activity';
@Component({
  selector: 'oa-task-submissions',
  templateUrl: './oa-task-submissions.component.html',
  styleUrls: ['./oa-task-submissions.component.scss'],
})

export class OaTaskSubmissionsComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public tasks: TaskModel;

  /**
   * @function checkSubmissionImage
   * This method is used to check the uploaded image
   */
  public checkSubmissionImage(uploaded) {
    return uploaded.submissionSubtype === IMAGE;
  }

  /**
   * @function checkSubmissionIcons
   * This method is used to check the uploaded file
   */
  public checkSubmissionIcons(uploaded) {
    return uploaded.submissionIcon === FILE;
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GuardianProfileModel, RoleModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { ModalService } from '@shared/providers/service/modal.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { ToastService } from '@shared/providers/service/toast.service';

@Component({
  selector: 'app-add-guardian-form',
  templateUrl: './add-guardian-form.component.html',
  styleUrls: ['./add-guardian-form.component.scss'],
})
export class AddGuardianFormComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public guardianForm: FormGroup;
  public submitted: boolean;
  public roleList: Array<RoleModel>;
  public guardianList: Array<GuardianProfileModel>;
  public customSelectOptions: { header: string };
  public showSuccessAlert: boolean;
  public successMessage: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    protected formBuilder: FormBuilder,
    private profileService: ProfileService,
    private translate: TranslateService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {
    this.guardianForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required]
    });
    this.customSelectOptions = {
      header: 'Role'
    };
  }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.roleList = this.profileService.relationshipList;
  }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function validateForm
   * This method is used to check the basic form validation
   */
  public get validateForm() {
    return this.guardianForm.controls;
  }

  /**
   * @function addGuardian
   * This method is used to add guardian
   */
  public addGuardian() {
    this.submitted = true;
    if (this.guardianForm.valid) {
      const guardianFormEntries = this.guardianForm.value;
      const requestParams = {
        email: guardianFormEntries.email,
        first_name: guardianFormEntries.firstName,
        last_name: guardianFormEntries.lastName,
        relationship_id: guardianFormEntries.roles
      };
      this.profileService.addGuardian(requestParams).then(() => {
        this.successMessage = this.translate.instant('GURADIAN_VERIFICATION_EMAIL_MSG', { nameOfGuardian: `${guardianFormEntries.firstName} ${guardianFormEntries.lastName}` });
        this.guardianForm.reset();
        this.submitted = false;
        this.showSuccessAlert = true;
      }).catch((error) => {
        if (error.data) {
          const errorMsg = error.data.message || 'SOMETHING_WENT_WRONG';
          this.displayToast(errorMsg);
        }
      });
    }
  }

  /**
   * @function displayToast
   * This method is used to display toast
   */
  private displayToast(errorMessage) {
    this.translate
      .get(errorMessage)
      .subscribe(value => {
        this.toastService.presentToast(value);
      });
  }

  /**
   * @function dismissModal
   * Method to close modal
   */
  public dismissModal() {
    this.modalService.dismiss({ isFetchGuardianList: true });
  }

  /**
   * @function dismissAlert
   * Method to close alert
   */
  public dismissAlert(value) {
    if (value) {
      this.dismissModal();
      this.showSuccessAlert = false;
    }
  }
}

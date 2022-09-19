import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CrossWalkSubjectModel } from '@shared/models/competency/competency';
import { TaxonomyGrades, TaxonomyModel } from '@shared/models/taxonomy/taxonomy';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { setTaxonomyGrades } from '@shared/stores/actions/taxonomy.action';
import { getTaxonomyGradesByClassId } from '@shared/stores/reducers/taxonomy.reducer';
import { cloneObject } from '@shared/utils/global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {

  // -------------------------------------------------------------------------
  // Properties

  private crossWalkSubject: BehaviorSubject<CrossWalkSubjectModel>;
  private categoriesSubject: BehaviorSubject<Array<TaxonomyModel>>;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private store: Store, private taxonomyProvider: TaxonomyProvider) {
    this.crossWalkSubject = new BehaviorSubject<CrossWalkSubjectModel>(null);
    this.categoriesSubject = new BehaviorSubject<Array<TaxonomyModel>>(null);
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchGradesBySubject
   * This method is used to fetch grades by using subject
   */
  public fetchGradesBySubject(filters): Promise<Array<TaxonomyGrades>> {
    return new Promise((resolve, reject) => {
      let key;
      if (filters.fw_code) {
        key = `${filters.fw_code}_${filters.subject}`;
      } else {
        key = `${filters.subject}`;
      }
      const taxonomyStoreSubscription = this.store.select(getTaxonomyGradesByClassId(key))
        .subscribe((taxonomyGrades) => {
          if (!taxonomyGrades) {
            this.taxonomyProvider.fetchGradesBySubject(filters).then((result) => {
              this.store.dispatch(setTaxonomyGrades({ key, data: result }));
              resolve(cloneObject(result));
            });
          } else {
            resolve(cloneObject(taxonomyGrades));
          }
        }, (error) => {
          reject(error);
        });
      taxonomyStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  public fetchCategories() {
    const categories = this.categories;
    return new Promise((resolve, reject) => {
      if (categories) {
        resolve(categories);
      } else {
        this.taxonomyProvider.fetchCategories().then((categoryList) => {
          this.categoriesSubject.next(categoryList);
          resolve(categoryList);
        });
      }
    });
  }

  /**
   * @function fetchSubjectById
   * This method is used to fetch taxonomy subject by id
   */
  public async fetchSubjectById(code) {
    return this.taxonomyProvider.fetchSubjectById(code);
  }

  /**
   * @function fetchCrossWalkFWC
   * This method is used to fetch Cross walk FWC.
   */
  public fetchCrossWalkFWC(frameworkId, subjectCode) {
    return new Promise((resolve, reject) => {
      const key = `${frameworkId}_${subjectCode}`;
      const crossWalk = this.crossWalkData;
      if (crossWalk && crossWalk[`${key}`]) {
        resolve(crossWalk[`${key}`]);
      } else {
        this.taxonomyProvider.fetchCrossWalkFWC(frameworkId, subjectCode).then((crossWalkData) => {
          const crossWalkModel = {
            [key]: crossWalkData,
            ...this.crossWalkData
          };
          this.crossWalkSubject.next(crossWalkModel);
          resolve(crossWalkData);
        }, reject);
      }
    });
  }

  get crossWalkData() {
    return this.crossWalkSubject ? cloneObject(this.crossWalkSubject.value) : null;
  }

  get categories() {
    return this.categoriesSubject ? cloneObject(this.categoriesSubject.value) : null;
  }
}

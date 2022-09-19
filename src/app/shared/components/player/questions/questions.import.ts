import { DragAndDropComponent } from '@shared/components/player/questions/drag-and-drop/drag-and-drop.component';
import { FillInTheBlanksComponent } from '@shared/components/player/questions/fill-in-the-blanks/fill-in-the-blanks.component';
import { FreeResponseComponent } from '@shared/components/player/questions/free-response/free-response.component';
import { HotTextHighlightComponent } from '@shared/components/player/questions/hot-text-highlight/hot-text-highlight.component';
import { MultipleAnswerComponent } from '@shared/components/player/questions/multiple-answer/multiple-answer.component';
import { MultipleChoiceComponent } from '@shared/components/player/questions/multiple-choice/multiple-choice.component';
import { MultipleSelectImageComponent } from '@shared/components/player/questions/multiple-select-image/multiple-select-image.component';
import { MultipleSelectTextComponent } from '@shared/components/player/questions/multiple-select-text/multiple-select-text.component';
import { TrueOrFalseComponent } from '@shared/components/player/questions/true-or-false/true-or-false.component';

// SERP Questions
import { ComprehensionComponent } from '@shared/components/player/questions/serp/comprehension/comprehension.component';
import { DecodingAssessmentComponent } from '@shared/components/player/questions/serp/decoding-assessment/decoding-assessment.component';
import { EncodingAssessmentComponent } from '@shared/components/player/questions/serp/encoding-assessment/encoding-assessment.component';
import { PickAndChooseComponent } from '@shared/components/player/questions/serp/pick-and-choose/pick-and-choose.component';
import { SayOutLoudComponent } from '@shared/components/player/questions/serp/say-out-loud/say-out-loud.component';
import { SerpMultipleChoiceComponent } from '@shared/components/player/questions/serp/serp-multiple-choice/serp-multiple-choice.component';
import { SerpSilentReadingComponent } from '@shared/components/player/questions/serp/serp-silent-reading/serp-silent-reading.component';
import { SortingComponent } from '@shared/components/player/questions/serp/sorting/sorting.component';
import { UpcomingQuestionComponent } from '@shared/components/player/questions/serp/upcoming-question/upcoming-question.component';

export const QUESTIONS = [
  DragAndDropComponent,
  FillInTheBlanksComponent,
  FreeResponseComponent,
  HotTextHighlightComponent,
  MultipleSelectImageComponent,
  MultipleSelectTextComponent,
  MultipleAnswerComponent,
  MultipleChoiceComponent,
  TrueOrFalseComponent,
  SayOutLoudComponent,
  EncodingAssessmentComponent,
  DecodingAssessmentComponent,
  PickAndChooseComponent,
  SortingComponent,
  ComprehensionComponent,
  UpcomingQuestionComponent,
  SerpMultipleChoiceComponent,
  SerpSilentReadingComponent

];


export const QUESTION_TYPES = {
  multiple_choice_question: MultipleChoiceComponent,
  multiple_answer_question: MultipleAnswerComponent,
  true_false_question: TrueOrFalseComponent,
  fill_in_the_blank_question: FillInTheBlanksComponent,
  hot_text_reorder_question: DragAndDropComponent,
  hot_text_highlight_question: HotTextHighlightComponent,
  hot_spot_text_question: MultipleSelectTextComponent,
  hot_spot_image_question: MultipleSelectImageComponent,
  open_ended_question: FreeResponseComponent,
  serp_lang_say_out_loud_question: SayOutLoudComponent,
  serp_encoding_assessment_question: EncodingAssessmentComponent,
  serp_decoding_assessment_question: DecodingAssessmentComponent,
  serp_pick_n_choose_question: PickAndChooseComponent,
  serp_sorting_question: SortingComponent,
  serp_lang_activities_for_comprehension_question: ComprehensionComponent,
  serp_multi_choice_question : SerpMultipleChoiceComponent,
  serp_silent_reading_question : SerpSilentReadingComponent
};

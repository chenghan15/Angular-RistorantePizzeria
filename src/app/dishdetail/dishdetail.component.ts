import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/Comment';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;

  errMess: string;

  dishcopy: Dish;

  visibility = 'shown';

  dishCommentForm: FormGroup;
  dishComment: Comment;
  @ViewChild('fform') dishCommentFormDirective;

  formErrors = {
    'comment': '',
    'author': ''
  };  

  validationMessages = {
    'comment': {
      'required':      'comment is required.',
      'minlength':     'comment must be at least 2 characters long.',
      'maxlength':     'comment cannot be more than 200 characters long.'
    },
    'author': {
      'required':      'author number is required.',
      'minlength':     'author must be at least 2 characters long.',
      'maxlength':     'author cannot be more than 25 characters long.'
    },
  };  

  constructor(private dishservice: DishService,
    private location: Location,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    @Inject('BaseURL') private baseURL) 
    { 
      this.createForm();
    }

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; }, 
      errmess => this.errMess = <any>errmess);
    }
  
    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
      this.location.back();    
    }

    createForm(){
      this.dishCommentForm = this.fb.group(
        {
          rating: 5,
          comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
          author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
        }
      );

      this.dishCommentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

      this.onValueChanged(); // (re)set validation messages now
     
    }

    onValueChanged(data?: any) {
      if (!this.dishCommentForm) { return; }
      const form = this.dishCommentForm;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }


    onSubmit(){
      this.dishComment = this.dishCommentForm.value;
      let now = new Date();
      this.dishComment.date = now.toISOString();

      console.log(this.dishComment);


      this.dishcopy.comments.push(this.dishComment);
      this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
      
      this.dishCommentFormDirective.resetForm();

      this.dishCommentForm.reset({
        rating: 5
      });      
    }
}

import { Component, OnInit, Input } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/Comment';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;

  dishCommentForm: FormGroup;
  dishComment: Comment;

  constructor(private dishservice: DishService,
    private location: Location,
    private route: ActivatedRoute,
    private fb: FormBuilder) 
    { 
      this.createForm();
    }

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
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
          comment: '',
          author: ''
          // date: '' 
        }
      );
    }

    onSubmit(){
      // this.dishComment = this.dishCommentForm.value;
      this.dishComment.rating = this.dishCommentForm.value['rating'];
      this.dishComment.author = this.dishCommentForm.value['author'];
      this.dishComment.comment = this.dishCommentForm.value['comment'];
      // this.dishComment.date = '';

      console.log(this.dishComment);
      this.dishCommentForm.reset();
    }
}

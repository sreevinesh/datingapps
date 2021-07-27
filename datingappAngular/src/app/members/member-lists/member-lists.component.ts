import { User } from 'src/app/_models/user';
import { UserParms } from './../../_models/userParms';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { MembersService } from 'src/app/_services/members.service';
import { AccountService } from 'src/app/_services/account.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-lists',
  templateUrl: './member-lists.component.html',
  styleUrls: ['./member-lists.component.css']
})
export class MemberListsComponent implements OnInit {
  members: Member[];
  pagination: Pagination;
  userParms:UserParms;
  user:User;
  genderList=[{value:'male', display:'Males'},{value:'female',display:'Females'}]

  constructor(private memberService: MembersService) {
    // this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
    //   this.user=user;
    //   this.userParms=new UserParms(user);
    // })
    this.userParms = this.memberService.getUserParams();
   }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.setUserParams(this.userParms);
    this.memberService.getMembers(this.userParms).subscribe(response => {
      console.log(response);
      if(response){
        this.members = response.result;
        this.pagination = response.pagination;
      }
    })
  }

  resetFilters(){
    this.userParms=this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged(event:any){
    this.userParms.pageNumber=event.page;
    this.memberService.setUserParams(this.userParms);
    this.loadMembers();
  }


}

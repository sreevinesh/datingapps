import { UserParms } from './../_models/userParms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { AccountService } from './account.service';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

// const httpOptions={
//   headers:new HttpHeaders({
//     Authorization:'Bearer ' + JSON.parse(localStorage.getItem('user')||'').token
//   })
// }

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache=new Map();
  user:User;
  userParms:UserParms;




  constructor(private http: HttpClient, private accountService : AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user=user;
      this.userParms=new UserParms(user);
  })
}

getUserParams(){
  return this.userParms;
}

setUserParams(params:UserParms){
  this.userParms=params;
}

resetUserParams(){
  this.userParms=new UserParms(this.user);
  return this.userParms;
}

  getMembers(userParms: UserParms) {
    var response=this.memberCache.get(Object.values(userParms).join('_'));
    if(response) {
      return of(response);
    }

    let params = getPaginationHeaders(
      userParms.pageNumber,
      userParms.pageSize
    );

    params = params.append('minAge', userParms.minAge.toString());
    params = params.append('maxAge', userParms.maxAge.toString());
    params = params.append('gender', userParms.gender);
    params = params.append('oredrBy', userParms.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'users',params, this.http)
    .pipe(map(response => {
      this.memberCache.set(Object.values(userParms).join('_'),response);
      return response;
    }))
  }



  getMember(username: string) {
    const member =[...this.memberCache.values()]
    .reduce((arr,elem) => arr.concat(elem.result), [])
    .find((member:Member) => member.username === username);
    if(member){
      return of(member);
    }

    // const member = this.members.find((x) => x.username === username);
    // if (member !== undefined) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username:string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {})
  }

  getLikes(predicate : string, pageNumber,pageSize) {
    let params = getPaginationHeaders(pageNumber,pageSize);
    params=params.append('predicate', predicate);
    return getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes',params, this.http);
  }


  }

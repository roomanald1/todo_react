import { BehaviorSubject } from "rxjs";
import { User } from "../types/User";
import { getCookie, removeCookie, setCookie } from "typescript-cookie";

export class UserModel {
        private userSub = new BehaviorSubject<User| undefined>(undefined);
        constructor(){
                    try{
                        const fromCookie = getCookie('user');
                        if (fromCookie){
                            this.userSub.next(JSON.parse(fromCookie));
                        }
                    }catch(e){
                        console.log(e);
                    }
            
        }

        getUser() {
            return this.userSub.getValue();
        }
        getUser$() {
            return this.userSub.asObservable();
        }
        setUser(v: any) {
            this.userSub.next(v);
            setCookie('user', JSON.stringify(v));
            if (!v) 
            {
                removeCookie('user');
            }
        }
}
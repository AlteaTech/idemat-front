import {Injectable} from '@angular/core';
import {LocalStorageModel} from '../models/local-storage-model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public setLocalStorage(key: string, value: string, ttlMinutes? : number | undefined): void {
    let localStorageModel: LocalStorageModel = new LocalStorageModel();
    localStorageModel.data = value;

    if(ttlMinutes){
      localStorageModel.expireDate = Date.now() + ttlMinutes * 60 * 1000;
    }

    localStorage.setItem(key, JSON.stringify(localStorageModel));
  }

  public getLocalStorage(key: string): string | null {
    const value = localStorage.getItem(key);

    if(!value){
      return null;
    }

    let result: LocalStorageModel= JSON.parse(value);
    if(result.expireDate && result.expireDate <= Date.now())
    {
      localStorage.removeItem(key);
      return null;
    }
    return result.data;
  }

  public deleteLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }
}

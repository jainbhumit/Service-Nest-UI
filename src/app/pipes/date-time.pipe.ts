import { DatePipe } from "@angular/common";
import { inject, Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'datetime',
  standalone:true
})
export class DateTimePipe implements PipeTransform{
  datePipe = inject(DatePipe); 
  transform(dateString: string) {
      dateString = dateString.replace('T',' ');
      dateString = dateString.replace('Z','');
      const newDateTime:string = this.datePipe.transform(dateString, 'M/d/yyyy, h:mm:ss a') || '' ;
      return newDateTime;
  }
}
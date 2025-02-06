import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name:'filter'
})
export class FilterPipe implements PipeTransform{
  transform(value: string) {
    return value.slice(0,5);
  }
}
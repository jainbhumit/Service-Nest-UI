import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name:'avg'
})
export class AveragePipe implements PipeTransform{
  transform(avg: number) {
    const newAvg:number = parseFloat(avg.toFixed(2));
    return newAvg
  }
}
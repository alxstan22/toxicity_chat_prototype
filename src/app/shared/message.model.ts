export class Message {
  timestamp: Date;
  text: string;

  constructor(msg: string){
    this.timestamp = new Date();
    this.text = msg;
  }
}

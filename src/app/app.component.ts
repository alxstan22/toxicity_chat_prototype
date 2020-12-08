import { Component } from '@angular/core';
import { Message } from './shared/message.model';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';

interface httpResp {
    block: boolean;
    reason: string[];
    user_message: string;
}

interface filterFormat {
  id: number;
  name: string;
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent{
  title = 'chat-demo';
  messages = [];
  filterChoices: any = [];
  finalFilters: any = [];

  onEnter(msg: string){
    if(msg){
      this.postRequest(msg, this.finalFilters)
    }
  }


  form: FormGroup;
//Fills checkboxes within ap.html
  filters: any = [
    {id: 1, name: 'Toxic'},
    {id: 2, name: 'Severe Toxic'},
    {id: 3, name: 'Obscene'},
    {id: 4, name: 'Threat'},
    {id: 5, name: 'Insult'},
    {id: 6, name: 'Identity Hate'}
  ];


  constructor(private formBuilder: FormBuilder){
    this.form = this.formBuilder.group({
      filts: this.formBuilder.array([], [Validators.required])
    })
  }

  onCheckboxChange(ev, fil){
    const filts: FormArray = this.form.get('filts') as FormArray;
    //When checkbox checked
    if(ev.target.checked){
      filts.push(new FormControl(ev.target.value));
      this.filterChoices.push(fil);

      let f = JSON.stringify(this.filterChoices);
      JSON.parse(f, (key, value) => {
        if(key === 'name'){
          //Add to filters if box checked
          if (this.finalFilters.includes(value) === false) this.finalFilters.push(value);
        }
      });

    }else{
      //When checkbox unchecked
      let indx = filts.controls.findIndex(x => x.value === ev.target.value);

      let k = JSON.stringify(fil);
      JSON.parse(k, (key, value) => {

        if(key === 'name'){
          if (this.finalFilters.includes(value) === true){
            let i = (ind) => ind ===value;
            let indx2 = this.finalFilters.findIndex(i);
            //Delete from filters if box unchecked
            this.finalFilters.splice(indx2, 1);
          }
        }
      });

      filts.removeAt(indx);
      this.filterChoices= this.filterChoices.filter(val => val != fil);
      filts.push(new FormControl(ev.target.value));
    }
  }


  postRequest(msg: string, f: any[]){
    //JSON POST request sends message and filter choices
    let sendData = { filters: f, text: msg};
    fetch('http://localhost:5000/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',},
      body: JSON.stringify(sendData),
    })
    .then((response) => response.json())
    //Sends successfully
    .then((data) => {
      console.log('Success:', data);
      let resp : httpResp = data;
      if(resp.block == false){
        var filly = JSON.stringify(f)
        //Send message to the chatbox screen
        this.messages.push(new Message(msg))
      }else{
        this.messages.push(new Message('(Message sent to Community Administrator due to filter settings. Reason: '+ resp.reason + ')'))
      }
    })
    //Handle error
    .catch((error) => {
      console.error('Error:', error);
      this.messages.push(new Message('(ERROR: Message cannot be sent)'))
    });
  }

}

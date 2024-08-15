import { Component } from '@angular/core';
import { VoiceRecognitionService } from './services/voice-control.service';
import { allowedCommands } from './constant/voiceControls';

interface EnteredCommand{
  text: string;
  status:boolean
}

interface ListedCommands{
  text: string;
  serial:number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'voiceControl';
  isMicOn = false;
  userCommands:EnteredCommand[] =[];
  allowedCommand:ListedCommands[] = allowedCommands;

  constructor(private voiceRecognitionService: VoiceRecognitionService) { }

  ngOnInit() {
    this.voiceRecognitionService.init();
  }
  handleMic(){
    this.isMicOn = !this.isMicOn;
    if(this.isMicOn){
      this.voiceRecognitionService.start();
      this.voiceRecognitionService.speechInputForToolbar().subscribe((voiceCommand: any) => {
          this.userCommands = [...this.userCommands,voiceCommand]
      });
    }else{
      this.voiceRecognitionService.stop();
    }
  }
}

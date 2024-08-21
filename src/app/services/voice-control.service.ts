import { Injectable } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { operationKeysToolBar } from '../constant/voiceControls';
import Fuse from 'fuse.js';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  recognition: any;
  isStoppedSpeechRecog = false;
  private voiceToToolbarSubject: Subject<any> = new Subject();
  private interimSubject: Subject<string> = new Subject<string>();
  private lastEmittedWord: string = ''; // Track the last emitted word
  private options: any = {
    includeScore: true,
    threshold: 0.0, // Adjust this threshold as needed
    keys: ['key', 'variations'],
  };


  constructor() {
    this.interimSubject
      .pipe(debounceTime(400)) // Wait for 0.5 seconds of silence before processing
      .subscribe(interimText => {
        this.emitTranscript(interimText);
      });
  }
  /**
   * @description Function to return observable for toolbar operations.
   */
  speechInputForToolbar() {
    return this.voiceToToolbarSubject.asObservable();
  }

  /**
   * @description Function to initialize voice recognition.
   */
  init() {
    try {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      console.log('SpeechRecognition initialized');

      this.recognition.addEventListener('result', (e: any) => {
        const transcript = Array.from(e.results)
          .map((result: any) => result[0])
          .map(result => result.transcript)
          .join('');

        const words = transcript.split(' '); // Split the transcript into words

        // Emit the most recent word only if it hasn't been emitted before
        const latestWord = words[words.length - 1];
        if (latestWord && latestWord !== this.lastEmittedWord) {
          this.emitTranscript(latestWord);
          this.lastEmittedWord = latestWord; // Update the last emitted word
        }
      });

      this.initListeners();
    } catch (error) {
      console.error('SpeechRecognition initialization failed:', error);
    }
  }

  /**
   * @description Add event listeners to handle when stopped.
   */
  initListeners() {
    this.recognition.addEventListener('end', () => {
      if (!this.isStoppedSpeechRecog) {
        this.recognition.start(); // Restart recognition if not manually stopped
      }
    });

    this.recognition.addEventListener('error', (event: any) => {
      console.error('SpeechRecognition error:', event.error);
    });
  }

  /**
   * @description Function to start listening.
   */
  start() {
    try {
      this.isStoppedSpeechRecog = false;
      console.log('Starting SpeechRecognition');
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start SpeechRecognition:', error);
    }
  }

  /**
   * @description Function to stop recognition.
   */
  stop() {
    try {
      this.isStoppedSpeechRecog = true;
      console.log('Stopping SpeechRecognition');
      this.recognition.stop();
      this.recognition.isActive = false;
    } catch (error) {
      console.error('Failed to stop SpeechRecognition:', error);
    }
  }
  findMatchedOperation(tempWords: any) {
    const fuse = new Fuse(operationKeysToolBar, this.options);
    const searchResults = fuse.search(tempWords.toLowerCase());

    if (searchResults.length > 0) {
      return searchResults[0].item.key; // Return the key of the best match
    }

    return null;
  }


  /**
 * @description Process the input word and emit segments separately if needed.
 */
private processAndEmitWord(latestWord: string) {
  // Check for specific patterns and emit accordingly
  if (/^\d+[a-zA-Z]$/.test(latestWord)) {
    // Pattern like "5x", "6y", etc.
    const numberPart = latestWord.slice(0, latestWord.length - 1);
    const letterPart = latestWord.slice(-1);

    // Emit number part
    this.voiceToToolbarSubject.next({
      text: numberPart,
      status: false,
    });

    // Emit letter part
    this.voiceToToolbarSubject.next({
      text: letterPart,
      status: false,
    });
  } else if (/^\d+[a-zA-Z]\s?square$/.test(latestWord)) {
    // Pattern like "5x square", "6y square", etc.
    const numberPart = latestWord.slice(0, latestWord.length - 7);
    const letterPart = latestWord.slice(-7, -6);

    // Emit combined part
    this.voiceToToolbarSubject.next({
      text: `${numberPart}${letterPart.toLowerCase()}`,
      status: false,
    });

    // Emit square icon
    this.voiceToToolbarSubject.next({
      text: '²', // Assuming the square is represented by '²' or any other icon
      status: false,
    });
  } else {
    // Emit the word as-is if no specific pattern is matched
    this.voiceToToolbarSubject.next({
      text: latestWord.toLowerCase(),
      status: false,
    });
  }
}

  /**
   * @description Emit the latest word immediately.
   */
  private emitTranscript(latestWord: string) {
    const matchedOperation = this.findMatchedOperation(latestWord);
    if (matchedOperation) {
      // Emit to toolbar observable
      console.log('matched operation', latestWord);
      this.voiceToToolbarSubject.next({
        text: `${latestWord} ---- matched with (${matchedOperation})`,
        status: true,
      });
    } else {
     // Perform operations before sending with status false
    this.processAndEmitWord(latestWord);
    }
  }
}

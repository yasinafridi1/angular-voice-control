import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { operationKeysToolBar } from '../constant/voiceControls';
import Fuse from 'fuse.js';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  recognition: any;
  isStoppedSpeechRecog = false;
  private speakingPaused: Subject<any> = new Subject();
  private tempWords: string = '';
  private silenceTimeout: any; // To track silence period
  private lastEmittedText: string = '';
  private voiceToDrawingBoardSubject: Subject<string[]> = new Subject();
  private voiceToToolbarSubject: Subject<any> = new Subject();
  private options: any = {
    includeScore: true,
    threshold: 0.2, // Adjust this threshold as needed
    keys: ['key', 'variations'],
  };


  /**
   * @description Function to return observable for canvas input.
   */
  speechInputForDrawingBoard() {
    return this.voiceToDrawingBoardSubject.asObservable();
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
        clearTimeout(this.silenceTimeout); // Reset the timer if the user is still speaking

        const transcript = Array.from(e.results)
          .map((result: any) => result[0])
          .map(result => result.transcript)
          .join('');

        // Store the transcript in tempWords for later use
        this.tempWords = transcript;
        // Set a timeout to emit the result after 2 seconds of silence
        this.silenceTimeout = setTimeout(() => {
          this.emitTranscript();
        }, 500); // Wait for 2 seconds of silence before emitting
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

    return this.speakingPaused.asObservable();
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
      clearTimeout(this.silenceTimeout); // Clear the silence timeout
      this.recognition.stop();
      this.recognition.isActive = false;
      this.speakingPaused.next('Stopped speaking');
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
   * @description Emit the accumulated text after silence.
   */
  private emitTranscript() {
    console.log('Sentence:', this.tempWords);
    if (this.tempWords !== this.lastEmittedText) {
      const matchedOperation = this.findMatchedOperation(this.tempWords);
      if (matchedOperation) {
        // Emit to toolbar observable
        console.log('matched operation', this.tempWords);
        this.voiceToToolbarSubject.next({
          text:`${this.tempWords} ---- matched with (${matchedOperation})`,
          status:true
        });
      } else {
        this.voiceToToolbarSubject.next({
          text: this.tempWords,
          status:false
        });
        
      }
    }
  }
}

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
  private recognizedSpeechSubject: Subject<any> = new Subject();
  private lastEmittedWord: string = ''; // Track the last emitted word
  private numberSequence: (string | number)[] = [];
  private timer: any; // Declare the timer property
  private options: any = {
    includeScore: true,
    threshold: 0.0, // Adjust this threshold as needed
    keys: ['key', 'variations'],
  };

  /**
   * @description Function to return observable for toolbar operations.
   */
  speechInputForToolbar() {
    return this.voiceToToolbarSubject.asObservable();
  }

  originalSpeechInputFromUser() {
    return this.recognizedSpeechSubject.asObservable();
  }

  /**
   * @description Function to initialize voice recognition.
   */
  init() {
    try {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.addEventListener('result', (e: any) => {
        const transcript = Array.from(e.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
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

    // Check for direct match
    if (searchResults.length > 0) {
      return searchResults[0].item.key; // Return the key of the best match
    }

    // Check for combinations like 2x, 3x, etc.
    const numberAndLetterPattern = /^(\d+)([a-zA-Z])$/; // Pattern to match number + letter
    const match = tempWords.match(numberAndLetterPattern);

    if (match) {
      const numberPart = match[1];
      const letterPart = match[2];

      // Check if the letter part matches a valid operation key (like x)
      const operationMatch = operationKeysToolBar.find(
        (item) =>
          item.variations.includes(letterPart.toLowerCase()) ||
          item.key === letterPart.toLowerCase(),
      );

      if (operationMatch) {
        return `${numberPart}${operationMatch.key}`;
      }
    }

    return null;
  }

  /**
   * @description Emit the latest word immediately.
   */
  private emitTranscript(latestWord: any) {
    this.recognizedSpeechSubject.next({
      text: latestWord,
    });

    // Clear any existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (!isNaN(latestWord)) {
      // If the latest word is a number
      this.numberSequence.push(latestWord);

      // Set a new timer for 1 second
      this.timer = setTimeout(() => {
        // Emit the last index value of numberSequence
        this.voiceToToolbarSubject.next({
          text: this.numberSequence[this.numberSequence.length - 1],
          status: true,
        });
        this.numberSequence = [];
      }, 1000);
    } else {
      // If the latest word is not a number
      if (this.numberSequence.length) {
        // Emit the last index value of numberSequence
        this.voiceToToolbarSubject.next({
          text: this.numberSequence[this.numberSequence.length - 1],
          status: true,
        });
        // Reset the numberSequence if necessary
        this.numberSequence = [];
      }

      // Attempt to match an operation
      const matchedOperation = this.findMatchedOperation(latestWord);
      if (matchedOperation) {
        // Emit to toolbar observable
        this.voiceToToolbarSubject.next({
          text: matchedOperation,
          status: true,
        });
      } else {
        return;
      }
    }
  }
}

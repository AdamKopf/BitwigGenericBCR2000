//Enhanced Generic Controller Script with Support for
//- all 16 Midi Channels + Omni
//- Poly Aftertouch to Expression
//- CCs fully mappable per Midi Channel...
//- Sending Midi Beat Clock.
//- Sending Feedback to the Controller for the CCs

loadAPI(1);

host.defineController("TomsScripts", "GenericBCR2000", "1.0", "f03747e0-d9f0-11e3-9c1a-0800200c9a66", "Thomas Helzle");
host.defineMidiPorts(1, 1);

// CC 0 and CCs 120+ are reserved
var LOWEST_CC = 1;
var HIGHEST_CC = 119;

// Two variables to hold the Values of all the CCs and to check if they have changed
var ccValue = initArray(0, ((HIGHEST_CC - LOWEST_CC + 1) * 16));
var ccValueOld = initArray(0, ((HIGHEST_CC - LOWEST_CC + 1) * 16));
var ccValueIgnore = initArray(0, ((HIGHEST_CC - LOWEST_CC + 1) * 16));
var ccValueLastTouchedTime = initArray(0, ((HIGHEST_CC - LOWEST_CC + 1) * 16));

// A function to create an indexed function for the Observers
function getValueObserverFunc(index, varToStore) {
  return function (value) {
    varToStore[index] = value;
  }
}

function init() {

  // Create 16 NoteInputs + Omni. Verbose to allow commenting out unneeded channels
  MultiBi = host.getMidiInPort(0).createNoteInput("Omni", "??????");
  MultiBi1 = host.getMidiInPort(0).createNoteInput("Ch 1", "?0????");
  MultiBi2 = host.getMidiInPort(0).createNoteInput("Ch 2", "?1????");
  MultiBi3 = host.getMidiInPort(0).createNoteInput("Ch 3", "?2????");
  MultiBi4 = host.getMidiInPort(0).createNoteInput("Ch 4", "?3????");
  MultiBi5 = host.getMidiInPort(0).createNoteInput("Ch 5", "?4????");
  MultiBi6 = host.getMidiInPort(0).createNoteInput("Ch 6", "?5????");
  MultiBi7 = host.getMidiInPort(0).createNoteInput("Ch 7", "?6????");
  MultiBi8 = host.getMidiInPort(0).createNoteInput("Ch 8", "?7????");
  MultiBi9 = host.getMidiInPort(0).createNoteInput("Ch 9", "?8????");
  MultiBi10 = host.getMidiInPort(0).createNoteInput("Ch 10", "?9????");
  MultiBi11 = host.getMidiInPort(0).createNoteInput("Ch 11", "?A????");
  MultiBi12 = host.getMidiInPort(0).createNoteInput("Ch 12", "?B????");
  MultiBi13 = host.getMidiInPort(0).createNoteInput("Ch 13", "?C????");
  MultiBi14 = host.getMidiInPort(0).createNoteInput("Ch 14", "?D????");
  MultiBi15 = host.getMidiInPort(0).createNoteInput("Ch 15", "?E????");
  MultiBi16 = host.getMidiInPort(0).createNoteInput("Ch 16", "?F????");

  // Disable the consuming of the events by the NoteInputs, so they are also available for mapping
  MultiBi.setShouldConsumeEvents(false);
  MultiBi1.setShouldConsumeEvents(false);
  MultiBi2.setShouldConsumeEvents(false);
  MultiBi3.setShouldConsumeEvents(false);
  MultiBi4.setShouldConsumeEvents(false);
  MultiBi5.setShouldConsumeEvents(false);
  MultiBi6.setShouldConsumeEvents(false);
  MultiBi7.setShouldConsumeEvents(false);
  MultiBi8.setShouldConsumeEvents(false);
  MultiBi9.setShouldConsumeEvents(false);
  MultiBi10.setShouldConsumeEvents(false);
  MultiBi11.setShouldConsumeEvents(false);
  MultiBi12.setShouldConsumeEvents(false);
  MultiBi13.setShouldConsumeEvents(false);
  MultiBi14.setShouldConsumeEvents(false);
  MultiBi15.setShouldConsumeEvents(false);
  MultiBi16.setShouldConsumeEvents(false);


  // Enable Midi Beat Clock. Comment out if you don't want that
  //host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);

  // Setting Callbacks for Midi and Sysex
  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);

  // Make CCs 1-119 freely mappable for all 16 Channels
  userControls = host.createUserControls((HIGHEST_CC - LOWEST_CC + 1) * 16);

  for (var i = LOWEST_CC; i <= HIGHEST_CC; i++) {
    for (var j = 1; j <= 16; j++) {
      // Create the index variable c
      var c = i - LOWEST_CC + (j - 1) * (HIGHEST_CC - LOWEST_CC + 1);
      // Set a label/name for each userControl
      userControls.getControl(c).setLabel("CC " + i + " - Channel " + j);
      // Add a ValueObserver for each userControl
      userControls.getControl(c).addValueObserver(127, getValueObserverFunc(c, ccValue));
    }
  }
}

// Updates the controller in an orderly manner when needed
// so that LEDs, Motors etc. react to changes in the Software
// without drowning the Controller with data
function flush() {
  for (var i = LOWEST_CC; i <= HIGHEST_CC; i++) {
    for (var j = 1; j <= 16; j++) {
      var c = i - LOWEST_CC + (j - 1) * (HIGHEST_CC - LOWEST_CC + 1);
      // Check if something has changed
      if ((ccValue[c] != ccValueOld[c]) && !ccValueIgnore[c]) {
        // If yes, send the updated value
        //println('host:' + ccValueOld[c] + ' ' + ccValue[c]);
        sendChannelController(j - 1, i, ccValue[c]);
        // And update the value for the next check
        ccValueOld[c] = ccValue[c];
      }
    }
  }
}

// Update the UserControlls when Midi Data is received
function onMidi(status, data1, data2) {
  //printMidi(status, data1, data2);

  if (isChannelController(status)) {
    if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC) {
      var index = data1 - LOWEST_CC + ((HIGHEST_CC - LOWEST_CC + 1) * MIDIChannel(status));
      //println('bcr:' + ccValueOld[index] +' '+ ccValue[index] +' '+ data2);
      ccValueIgnore[index] = true;
      // ccValueOld[index] = data2;
      // ccValue[index] = data2;
      // println('bcrAfter:' + ccValueOld[index] +' '+ ccValue[index] +' '+ data2);
      userControls.getControl(index).set(data2, 128);
      ccValueLastTouchedTime[index] = Date.now();
      host.scheduleTask(unignoreHostChange, [index], 50);
    }
  }
}

function onSysex(data) {
  //printSysex(data);
}

function unignoreHostChange(cc) {
  if (Date.now() - ccValueLastTouchedTime[cc] > 49){
    ccValueIgnore[cc] = false;
  }
}

function exit() {
  // nothing to see here :-)
}
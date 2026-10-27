// state: mutable values that several modules read and write (mode, current room, timers, flags).
// late:  functions and objects defined in modules that load AFTER the module using them.
//        Filled in by the defining module; read only while the game runs, never at load.
export const state = {};
export const late = {};

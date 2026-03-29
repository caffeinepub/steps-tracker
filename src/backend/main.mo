import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";

actor {
  type DayLog = {
    date : Text;
    steps : Int;
  };

  let dayLogs = Map.empty<Text, DayLog>();

  // Add steps to today's count
  public shared ({ caller }) func addSteps(date : Text, steps : Int) : async Int {
    let currentSteps = switch (dayLogs.get(date)) {
      case (?dayLog) { dayLog.steps };
      case (null) { 0 };
    };
    let newDailyLog : DayLog = {
      date;
      steps = currentSteps + steps;
    };
    dayLogs.add(date, newDailyLog);
    newDailyLog.steps;
  };

  // Overwrite today's count
  public shared ({ caller }) func logSteps(date : Text, steps : Int) : async () {
    let newDailyLog : DayLog = {
      date;
      steps;
    };
    dayLogs.add(date, newDailyLog);
  };

  public query ({ caller }) func getTodaySteps(date : Text) : async Int {
    switch (dayLogs.get(date)) {
      case (null) { 0 };
      case (?dayLog) { dayLog.steps };
    };
  };

  public query ({ caller }) func getLast7Days(startDate : Int) : async [DayLog] {
    dayLogs.entries().filter(
      func((date, _)) {
        switch (date.toInt()) {
          case (null) { false };
          case (?dateInt) { dateInt >= startDate };
        };
      }
    ).toArray().map(
      func((_, dayLog)) { dayLog }
    );
  };
};

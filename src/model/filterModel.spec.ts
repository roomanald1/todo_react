import { FilterModel, FilterOp } from "./filterModel";

describe("FilterModel", () => {
  let filterModel: FilterModel;

  beforeEach(() => {
    filterModel = new FilterModel();
  });

  it("should initialize with todaySub as true", (done) => {
    filterModel.getToday$().subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });

  it("should toggle todaySub value", (done) => {
    const expectedValues = [true, false, true];
    let index = 0;

    const subscription = filterModel.getToday$().subscribe((value) => {
      expect(value).toBe(expectedValues[index]);
      index++;
      if (index === expectedValues.length) {
        subscription.unsubscribe();
        done();
      }
    });

    // Initial state is true, so we expect true first
    filterModel.toggleToday(); // Should change to false
    filterModel.toggleToday(); // Should change back to true
  });

  it("should initialize with filterSub as 'open'", (done) => {
    filterModel.getFilter$().subscribe((value) => {
      expect(value).toBe("open");
      done();
    });
  });

  it("should set and get filter correctly", (done) => {
    const expectedValues: FilterOp[] = ["completed", "all"];
    let index = 0;

    const subscription = filterModel.getFilter$().subscribe((value) => {
      if (index > 0) {
        expect(value).toBe(expectedValues[index - 1]);
      }
      index++;
      if (index === expectedValues.length + 1) {
        subscription.unsubscribe();
        done();
      }
    });

    filterModel.setFilter("completed");
    filterModel.setFilter("all");
  });

  it("should emit correct values from getFilter$", (done) => {
    const expectedValues: FilterOp[] = ["open", "completed", "all"];
    let index = 0;

    const subscription = filterModel.getFilter$().subscribe((value) => {
      expect(value).toBe(expectedValues[index]);
      index++;
      if (index === expectedValues.length) {
        subscription.unsubscribe();
        done();
      }
    });

    filterModel.setFilter("completed");
    filterModel.setFilter("all");
  });
});
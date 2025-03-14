import { reconcile, Todo } from "./applicationState";

describe("reconcile", () => {
  it("should return an empty array when both inputs are empty", () => {
    const result = reconcile([], []);
    expect(result).toEqual([]);
  });

  it("should return the new items when old items are empty", () => {
    const newItems: Partial<Todo>[] = [
      { id: 1, description: "New Item 1", added_on: "2023-10-01", user_id: "user1" },
      { id: 2, description: "New Item 2", added_on: "2023-10-02", user_id: "user1" },
    ];

    // Expected result should match the sorted order and any modifications made by reconcile
    const expectedResult: Partial<Todo>[] = [
        { id: 2, description: "New Item 2", added_on: "2023-10-02", user_id: "user1" },
        { id: 1, description: "New Item 1", added_on: "2023-10-01", user_id: "user1" },
        ];
    const result = reconcile([], newItems);
    expect(result).toEqual(expectedResult);
  });

  it("should return the old items when new items are empty", () => {
    const oldItems: Todo[] = [
      { id: 1, description: "Old Item 1", completed: false, added_on: "2023-09-01", user_id: "user1" },
      { id: 2, description: "Old Item 2", completed: true, added_on: "2023-09-02", user_id: "user1" },
    ];
  
    // Expected result should be sorted by added_on or last_updated
    const expectedResult: Todo[] = [
      { id: 2, description: "Old Item 2", completed: true, added_on: "2023-09-02", user_id: "user1" },
      { id: 1, description: "Old Item 1", completed: false, added_on: "2023-09-01", user_id: "user1" },
    ];
  
    const result = reconcile(oldItems, []);
    expect(result).toEqual(expectedResult);
  });

  it("should reconcile items and remove duplicates based on id", () => {
    const oldItems: Todo[] = [
      { id: 1, description: "Old Item 1", completed: false, added_on: "2023-09-01", user_id: "user1" },
      { id: 2, description: "Old Item 2", completed: true, added_on: "2023-09-02", user_id: "user1" },
    ];
    const newItems: Partial<Todo>[] = [
      { id: 1, description: "New Item 1", added_on: "2023-10-01", user_id: "user1" },
      { id: 3, description: "New Item 3", added_on: "2023-10-03", user_id: "user1" },
    ];
  
    // Expected result should reflect the sorted order and deduplication
    const expectedResult: Partial<Todo>[] = [
      { id: 3, description: "New Item 3", added_on: "2023-10-03", user_id: "user1" },
      { id: 1, description: "New Item 1", added_on: "2023-10-01", user_id: "user1" },
      { id: 2, description: "Old Item 2", completed: true, added_on: "2023-09-02", user_id: "user1" },
    ];
  
    const result = reconcile(oldItems, newItems);
    expect(result).toEqual(expectedResult);
  });

  it("should sort items by last_updated or added_on", () => {
    const oldItems: Todo[] = [
      { id: 1, description: "Old Item 1", completed: false, added_on: "2023-09-01", last_updated: "2023-09-05", user_id: "user1" },
      { id: 2, description: "Old Item 2", completed: true, added_on: "2023-09-02", user_id: "user1" },
    ];
    const newItems: Partial<Todo>[] = [
      { id: 3, description: "New Item 3", added_on: "2023-10-03", user_id: "user1" },
      { id: 4, description: "New Item 4", added_on: "2023-10-02", last_updated: "2023-10-04", user_id: "user1" },
    ];
    const result = reconcile(oldItems, newItems);
    expect(result).toEqual([
      { id: 4, description: "New Item 4", added_on: "2023-10-02", last_updated: "2023-10-04", user_id: "user1" },
      { id: 3, description: "New Item 3", added_on: "2023-10-03", user_id: "user1" },
      { id: 1, description: "Old Item 1", completed: false, added_on: "2023-09-01", last_updated: "2023-09-05", user_id: "user1" },
      { id: 2, description: "Old Item 2", completed: true, added_on: "2023-09-02", user_id: "user1" },
    ]);
  });
});

import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import { UserModel } from "./userModel";
import { User } from "../types/User";

describe("UserModel", () => {
    let userModel: UserModel;
    const mockUser: User = {
        email: "test@example.com",
        email_verified: true,
        family_name: "Doe",
        given_name: "John",
        name: "John Doe",
    };

    beforeEach(() => {
        userModel = new UserModel();
        jest.clearAllMocks();
    });

    it("should initialize with undefined user", () => {
        expect(userModel.getUser()).toBeUndefined();
    });

    it("should set and get user correctly", () => {
        userModel.setUser(mockUser);
        expect(userModel.getUser()).toEqual(mockUser);
        expect(setCookie).toHaveBeenCalledWith("user", JSON.stringify(mockUser));
    });

    it("should remove user and cookie when setting user to undefined", () => {
        userModel.setUser(undefined);
        expect(userModel.getUser()).toBeUndefined();
        expect(removeCookie).toHaveBeenCalledWith("user");
    });

    it("should initialize user from cookie if available", () => {
        (getCookie as jest.Mock).mockReturnValueOnce(JSON.stringify(mockUser));
        userModel = new UserModel();
        expect(userModel.getUser()).toEqual(mockUser);
    });

    it("should handle invalid JSON in cookie gracefully", () => {
        (getCookie as jest.Mock).mockReturnValueOnce("invalid JSON");
        expect(() => new UserModel()).not.toThrow();
        expect(userModel.getUser()).toBeUndefined();
    });
});
import { ApiError } from "@etsoo/restclient";
import { ActionResult, ActionResultError } from "../../src";


// Arrange
var message = 'Not Found';
var status = 500;
var error: ApiError = new ApiError(message, status);

// Act
var result = ActionResult.create(error);

test('Tests for ActionResult.Create', () => {
    // Assert
    expect(result.type).toBe('ApiError');
    expect(result.title).toBe(message);
    expect(result.status).toBe(status);
});

test('Tests for ActionResultError.format', () => {
    // Arrange & act
    var error = new ActionResultError(result);

    // Assert
    expect(error.name).toBe('ActionResultError');
    expect(error.message).toBe(`${message}(${status}, ApiError)`);
});
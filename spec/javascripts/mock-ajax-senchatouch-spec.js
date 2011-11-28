describe("Jasmine Mock Ajax (for Sencha Touch)", function() {
  var request, anotherRequest, response;
  var success, failure, callback;
  var sharedContext = {};
  var jquery = jQuery;
  var prototype = Prototype;

  beforeEach(function() {
    jQuery = undefined;
    Prototype = undefined;
    jasmine.Ajax.useMock();

    success = jasmine.createSpy("onSuccess");
    failure = jasmine.createSpy("onFailure");
    callback = jasmine.createSpy("onCallback");
  });

  afterEach(function() {
    jQuery = jquery;
    Prototype = prototype;
  });

  describe("when making a request", function () {
    beforeEach(function() {
      Ext.Ajax.request({
        url: "example.com/someApi",
        method: "GET",
        disableCaching: false,
        callback: callback,
        success: success,
        failure: failure
      });
      request = mostRecentAjaxRequest();
    });

    it("should store URL and transport", function() {
      expect(request.url).toEqual("example.com/someApi");
    });

    it("should queue the request", function() {
      expect(ajaxRequests.length).toEqual(1);
    });

    it("should allow access to the queued request", function() {
      expect(ajaxRequests[0]).toEqual(request);
    });

    describe("and then another request", function () {
      beforeEach(function() {
        Ext.Ajax.request({
          url: "example.com/someApi",
          method: "GET",
          disableCaching: false,
          callback: callback,
          success: success,
          failure: failure
        });

        anotherRequest = mostRecentAjaxRequest();
      });

      it("should queue the next request", function() {
        expect(ajaxRequests.length).toEqual(2);
      });

      it("should allow access to the other queued request", function() {
        expect(ajaxRequests[1]).toEqual(anotherRequest);
      });
    });

    describe("mostRecentAjaxRequest", function () {

      describe("when there is one request queued", function () {
        it("should return the request", function() {
          expect(mostRecentAjaxRequest()).toEqual(request);
        });
      });

      describe("when there is more than one request", function () {
        beforeEach(function() {
          Ext.Ajax.request({
            url: "example.com/someApi",
            method: "GET",
            disableCaching: false,
            callback: callback,
            success: success,
            failure: failure
          });
          anotherRequest = mostRecentAjaxRequest();
        });

        it("should return the most recent request", function() {
          expect(mostRecentAjaxRequest()).toEqual(anotherRequest);
        });
      });

      describe("when there are no requests", function () {
        beforeEach(function() {
          clearAjaxRequests();
        });

        it("should return null", function() {
          expect(mostRecentAjaxRequest()).toEqual(null);
        });
      });
    });

    describe("clearAjaxRequests()", function () {
      beforeEach(function() {
        clearAjaxRequests();
      });

      it("should remove all requests", function() {
        expect(ajaxRequests.length).toEqual(0);
        expect(mostRecentAjaxRequest()).toEqual(null);
      });
    });
  });

  describe("when simulating a response with request.response", function () {
    describe("and the response is Success", function () {
      beforeEach(function() {
        Ext.Ajax.request({
          headers: {
            'Accept': 'text/html'
          },
          url: "example.com/someApi",
          method: "GET",
          disableCaching: false,
          callback: callback,
          success: success,
          failure: failure
        });
        request = mostRecentAjaxRequest();
        response = {status: 200, contentType: "text/html", responseText: "OK!"};
        request.response(response);

        sharedContext.responseCallback = success;
        sharedContext.status = response.status;
        sharedContext.contentType = response.contentType;
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(success).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(failure).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(callback).toHaveBeenCalled();
      });

      sharedAjaxResponseBehaviorForSenchaTouch_Success(sharedContext);
    });

    describe("and the response is Success, but with JSON", function () {
      beforeEach(function() {
        Ext.Ajax.request({
          headers: {
            'Accept': 'application/json'
          },
          url: "example.com/someApi",
          method: "GET",
          disableCaching: false,
          callback: callback,
          success: success,
          failure: failure
        });
        request = mostRecentAjaxRequest();
        var responseObject = {status: 200, contentType: "application/json", responseText: '{"foo":"bar"}'};

        request.response(responseObject);

        sharedContext.responseCallback = success;
        sharedContext.status = responseObject.status;
        sharedContext.contentType = responseObject.contentType;
        sharedContext.responseText = responseObject.responseText;
        
        response = success.mostRecentCall.args[2];
      });

      it("should call the success handler", function() {
        expect(success).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(failure).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(callback).toHaveBeenCalled();
      });

      it("should return a JavaScript object", function() {
        expect(Ext.decode(success.mostRecentCall.args[0].responseText)).toEqual({foo: "bar"});
      });

      sharedAjaxResponseBehaviorForSenchaTouch_Success(sharedContext);
    });

    describe("the content type defaults to application/json", function () {
      beforeEach(function() {
        Ext.Ajax.request({
          url: "example.com/someApi",
          method: "GET",
          disableCaching: false,
          callback: callback,
          success: success,
          failure: failure
        });
        request = mostRecentAjaxRequest();
        response = {status: 200, responseText: '{"foo": "valid JSON, dammit."}'};
        request.response(response);

        sharedContext.responseCallback = success;
        sharedContext.status = response.status;
        sharedContext.contentType = "application/json";
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(success).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(failure).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(callback).toHaveBeenCalled();
      });

      sharedAjaxResponseBehaviorForSenchaTouch_Success(sharedContext);
    });

    describe("and the status/response code is 0", function () {
      beforeEach(function() {
        Ext.Ajax.request({
          url: "example.com/someApi",
          method: "GET",
          disableCaching: false,
          callback: callback,
          success: success,
          failure: failure
        });
        request = mostRecentAjaxRequest();
        response = {status: 0, contentType: "application/json", responseText: '{"foo": "whoops!"}'};
        request.response(response);

        sharedContext.responseCallback = failure;
        sharedContext.status = response.status;
        sharedContext.contentType = response.contentType;
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(success).not.toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(failure).toHaveBeenCalled();
      });
      
      it("should call the complete handler", function() {
        expect(callback).toHaveBeenCalled();
      });

      sharedAjaxResponseBehaviorForSenchaTouch_Failure(sharedContext);
    });
  });

  describe("and the response is error", function () {
    beforeEach(function() {
      Ext.Ajax.request({
        url: "example.com/someApi",
        method: "GET",
        disableCaching: false,
        callback: callback,
        success: success,
        failure: failure
      });
      request = mostRecentAjaxRequest();
      response = {status: 500, contentType: "text/html", responseText: "(._){"};
      request.response(response);

      sharedContext.responseCallback = failure;
      sharedContext.status = response.status;
      sharedContext.contentType = response.contentType;
      sharedContext.responseText = response.responseText;
    });

    it("should not call the success handler", function() {
      expect(success).not.toHaveBeenCalled();
    });

    it("should call the failure handler", function() {
      expect(failure).toHaveBeenCalled();
    });

    it("should call the complete handler", function() {
      expect(callback).toHaveBeenCalled();
    });

    sharedAjaxResponseBehaviorForSenchaTouch_Failure(sharedContext);
  });

  describe('when simulating a response with request.responseTimeout', function() {
    beforeEach(function() {
      jasmine.Clock.useMock();

      Ext.Ajax.request({
        url: "example.com/someApi",
        method: "GET",
        disableCaching: false,
        callback: callback,
        success: success,
        failure: failure
      });
      request = mostRecentAjaxRequest();
      response = {contentType: "text/html", responseText: "(._){"};
      request.responseTimeout(response);

      sharedContext.responseCallback = failure;
      sharedContext.status = response.status;
      sharedContext.contentType = response.contentType;
      sharedContext.responseText = response.responseText;
    });

    it("should not call the success handler", function() {
      expect(success).not.toHaveBeenCalled();
    });

    it("should call the failure handler", function() {
      expect(failure).toHaveBeenCalled();
    });

    it("should call the complete handler", function() {
      expect(callback).toHaveBeenCalled();
    });
  });
});


function sharedAjaxResponseBehaviorForSenchaTouch_Success(context) {
  describe("the success response", function () {
    var xhr;
    beforeEach(function() {
      xhr = context.responseCallback.mostRecentCall.args[0];
    });

    it("should have the expected status code", function() {
      expect(xhr.status).toEqual(context.status);
    });

    it("should have the expected content type", function() {
      expect(xhr.getResponseHeader('Content-type')).toEqual(context.contentType);
    });

    it("should have the expected response text", function() {
      expect(xhr.responseText).toEqual(context.responseText);
    });
  });
}

function sharedAjaxResponseBehaviorForSenchaTouch_Failure(context) {
  describe("the failure response", function () {
    var xhr;
    beforeEach(function() {
      xhr = context.responseCallback.mostRecentCall.args[0];
    });

    it("should have the expected status code", function() {
      expect(xhr.status).toEqual(context.status);
    });

    it("should have the expected content type", function() {
      expect(xhr.getResponseHeader('Content-type')).toEqual(context.contentType);
    });

    it("should have the expected response text", function() {
      expect(xhr.responseText).toEqual(context.responseText);
    });
  });
}

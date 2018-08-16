// describe("nvssoclient", function () {
// 	describe("#setSSOUrl()", function () {
// 		it("should return the proper sso url after being set", function () {
// 			nvssoclient.setSSOUrl("---protected/alsiusredirect/");
// 			expect(nvssoclient.url).to.equal("---protected/alsiusredirect/");
// 		});
// 	});
// 	describe("#hash()", function () {
// 		it("get the hash value", function () {
// 			window.location.hash = "testhash=testvalue";
// 			var hash = nvssoclient.hash();
// 			console.log(hash);
// 			expect(hash).to.be.a("string");
// 			expect(hash).to.equal("testhash=testvalue");
// 		});
// 	});
// 	describe("#getSmSession()", function () {
// 		it("smSession available", function () {
// 			expect(smSession).to.be.a("string");
// 		});
// 	});
// 	describe("#getUserData()", function () {
// 		it("getUserData has access_token", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("access_token");
// 		});
// 		it("getUserData has refresh_token", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("refresh_token");
// 		});
// 		it("getUserData has expires_in", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("expires_in");
// 		});
// 		it("getUserData has login_name", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("login_name");
// 		});
// 		it("getUserData has full_user_name", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("full_user_name");
// 		});
// 		it("getUserData has email", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("email");
// 		});
// 		it("getUserData has dn", function () {
// 			return expect(nvssoclient.getUserData()).to.have.property("dn");
// 		});
// 	});
// });

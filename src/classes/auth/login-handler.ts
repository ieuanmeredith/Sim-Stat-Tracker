export class LoginHandler {
    public static login(response: any): { success: boolean, authcookie: string | null} {
        let cookieObjects: object[] = [];

        // get cookies from response
        let cookies = response.headers["set-cookie"];
        // for each cookie, turn string into object
        for (let i = 0; i < cookies.length; i++) {
          let cookieObject = {};
          let splitCookie = cookies[i].split(";");
          for (let j = 0; j < splitCookie.length; j++) {
            let cookieCrumbs = splitCookie[j].split("=");
            cookieObject[cookieCrumbs[0]] = cookieCrumbs[1];
          }
          cookieObjects.push(cookieObject);
        }

        // find auth cookie object
        for (let i = 0; i < cookieObjects.length; i++) {
          // if auth cookie isnt empty
          // login successful, return true
          if (cookieObjects[i]["irsso_membersv2"] &&
              cookieObjects[i]["irsso_membersv2"] !== "\"\"") {
            return {
                success: true,
                authcookie: cookies[i]
            };
          }
        }
        // else login failed return false
        return { success: true, authcookie: null };
    }
}

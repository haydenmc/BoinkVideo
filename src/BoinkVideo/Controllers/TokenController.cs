using BoinkVideo.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Mvc;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BoinkVideo.Controllers
{
    public class TokenController : Controller
    {
        private UserManager<ApplicationUser> _userManager;
        private SignInManager<ApplicationUser> _signInManager;
        private TokenAuthOptions _tokenOptions;

        public TokenController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenAuthOptions tokenOptions)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenOptions = tokenOptions;
        }

        public class AuthRequest
        {
            public string username { get; set; }
            public string password { get; set; }
        }

        /// <summary>
        /// Request a new token for a given username/password pair.
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<dynamic> Post([FromBody] AuthRequest req)
        {
            // Obviously, at this point you need to validate the username and password against whatever system you wish.
            var signin = await _signInManager.PasswordSignInAsync(req.username, req.password, false, false);
            if (signin.Succeeded)
            {
                DateTime? expires = DateTime.UtcNow.AddDays(1);
                var token = await GetToken(req.username, expires);
                return new { authenticated = true, entityId = 1, token = token, tokenExpires = expires };
            }
            return new { authenticated = false };
        }

        private async Task<string> GetToken(string username, DateTime? expires)
        {
            var handler = new JwtSecurityTokenHandler();
            var user = await _userManager.FindByNameAsync(username);
            var principal = await _signInManager.CreateUserPrincipalAsync(user);
            var claimsIdentity = new ClaimsIdentity(principal.Identity, principal.Claims);

            var securityToken = handler.CreateToken(
                issuer: _tokenOptions.Issuer,
                audience: _tokenOptions.Audience,
                signingCredentials: _tokenOptions.SigningCredentials,
                subject: claimsIdentity,
                expires: expires
                );
            return handler.WriteToken(securityToken);
        }

    }
}

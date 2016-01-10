using Microsoft.AspNet.Authorization;
using Microsoft.AspNet.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BoinkVideo.Controllers
{
    [Route("api/[controller]")]
    [Authorize("Bearer")]
    public class TestController : Controller
    {
        [HttpGet]
        public string Get()
        {
            var name = User.Identity.Name;
            return "Yay! Hi " + name;
        }
    }
}

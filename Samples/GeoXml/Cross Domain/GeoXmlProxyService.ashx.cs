using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace Samples.GeoXml
{
    /// <summary>
    /// This Proxy is not required if the file being used in your application is hosted on the same domain as the web application. 
    /// If accessing files from else where this proxy is needed to get around cross domain access issues.
    /// </summary>
    public class GeoXmlProxyService : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            string url = context.Request.QueryString["url"];

            //Setup response caching for 5 minutes (adjust as you see fit).
            SetCacheHeaders(DateTime.UtcNow.AddMinutes(5), context);

            //Add CORs allowed origin.
            context.Response.AppendHeader("Access-Control-Allow-Origin", "*");

            //Generate response
            HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);

            try
            {
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();

                var contentType = response.Headers["Content-Type"];
                context.Response.ContentType = contentType;

                if (IsCompressedContentType(contentType))
                {
                    using (var stream = response.GetResponseStream())
                    {
                        context.Response.BufferOutput = false;
                        byte[] buffer = new byte[1024];
                        int bytesRead = 0;
                        while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
                        {
                            context.Response.OutputStream.Write(buffer, 0, bytesRead);
                        }
                    }
                }
                else
                {
                    //Assume the response is text or XML.
                    StreamReader stream = new StreamReader(response.GetResponseStream(), Encoding.ASCII);
                    context.Response.Write(stream.ReadToEnd());
                }
            }
            catch
            {
                //Unable to read URL. Return a null response.
                context.Response.Write(null);
            }

            context.ApplicationInstance.CompleteRequest();
        }

        public bool IsReusable
        {
            get
            {
                return true;
            }
        }

        #region Methods

        private bool IsCompressedContentType(string contentType)
        {
            return (string.Compare(contentType, "application/vnd.google-earth.kmz") == 0 ||
                string.Compare(contentType, "application/zip") == 0 ||
                string.Compare(contentType, "application/octet-stream") == 0);
        }

        protected void SetCacheHeaders(DateTime length, HttpContext context)
        {
            if (length != null)
            {
                context.Response.Cache.SetExpires(length);
                context.Response.Cache.SetValidUntilExpires(true);
                context.Response.Cache.SetCacheability(HttpCacheability.Public);
            }
            else
            {
                //If no cache length specified, disable caching.
                context.Response.Cache.SetExpires(DateTime.UtcNow.AddDays(-1));
                context.Response.Cache.SetValidUntilExpires(false);
                context.Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);
                context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
                context.Response.Cache.SetNoStore();
            }
        }

        #endregion
    }
}
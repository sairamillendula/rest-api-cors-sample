package controllers

import scala.concurrent._
import ExecutionContext.Implicits.global

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs._
import com.typesafe.config._
import models._

object Application extends Controller {
  private val config = ConfigFactory.load()
  private val zapi = config.getConfig("zapi").withFallback(config)
  private val schema = zapi.getString("schema")
  private val port = zapi.getInt("port")

  private val zuoraApiBaseURL = s"""$schema://${zapi.getString("host")}${if (schema == "https" && port == 443) "" else ":" + port }/${zapi.getString("appcontext")}"""
  private val apiAccessKeyId = zapi.getString("user")
  private val apiSecretAccessKey = zapi.getString("password")


  def lookupAccount(internalId: Long)(block: Account => Future[SimpleResult]) = 
    Account.findById(internalId) match {
      case Some(a) =>
        block(a)

      case None =>
        Future(NotFound(s"Account by id: $internalId can not be found."))
    }

  def signature(internalId: Long) = Action.async {

    lookupAccount(internalId) { account =>

      val result: Future[ws.Response] = {
        ws.WS.url(zuoraApiBaseURL + "/v1/hmac-signatures")
        .withHeaders(("apiAccessKeyId", apiAccessKeyId), ("apiSecretAccessKey", apiSecretAccessKey), ("Accept", "application/json"), ("Content-Type", "application/json"))
        .post(s"""
          {
            "uri": "$zuoraApiBaseURL/v1/payment-methods/credit-cards",
            "method": "POST",
            "accountKey": "${account.zNumber}}"
          }
          """)
      }

      result map { resp =>
        Ok(resp.json.toString).as("application/json")
      }
    }

  }

  def listCards(internalId: Long) = Action.async {
    
    lookupAccount(internalId) { account =>
        val result: Future[ws.Response] = {
          val getCardsUrl = zuoraApiBaseURL + s"/v1/payment-methods/credit-cards/accounts/${account.zNumber}"
          println(getCardsUrl)
          ws.WS.url(getCardsUrl)
          .withHeaders(("apiAccessKeyId", apiAccessKeyId), ("apiSecretAccessKey", apiSecretAccessKey), ("Accept", "application/json"), ("Content-Type", "application/json"))
          .get()
        }

        result map { resp =>
          println(resp.body)
          Ok(Json.stringify(resp.json)).as("application/json")
        }
    }

  }

  def index = Action {
    Redirect("/index.html")
  }
}
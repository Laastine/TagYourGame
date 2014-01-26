import sbt._
import Keys._
import org.scalatra.sbt._
import org.scalatra.sbt.PluginKeys._
import com.mojolly.scalate.ScalatePlugin._
import ScalateKeys._

object ServerBuild extends Build {
  val Organization = "org.fgj"
  val Name = "server"
  val Version = "0.1"
  val ScalaVersion = "2.10.2"
  val ScalatraVersion = "2.3.0-SNAPSHOT"
  val json4sversion = "3.2.5"
  val jettyVersion = "8.1.14.v20131031"

  lazy val project = Project (
    "server",
    file("."),
    settings = Defaults.defaultSettings ++ ScalatraPlugin.scalatraWithJRebel ++ scalateSettings ++ Seq(
      organization := Organization,
      name := Name,
      version := Version,
      scalaVersion := ScalaVersion,
      resolvers += "Sonatype OSS Snapshots" at "http://oss.sonatype.org/content/repositories/snapshots/",
      resolvers += "Akka Repo" at "http://repo.akka.io/repository",
      libraryDependencies ++= Seq(
        "org.json4s" %% "json4s-jackson" % json4sversion,
        "org.scalatra" %% "scalatra" % ScalatraVersion,
        "org.scalatra" %% "scalatra-scalate" % ScalatraVersion,
        "org.scalatra" %% "scalatra-specs2" % ScalatraVersion % "test",
        "org.scalatra" %% "scalatra-atmosphere" % ScalatraVersion,
        "ch.qos.logback" % "logback-classic" % "1.0.13" % "runtime",
        "org.eclipse.jetty" % "jetty-webapp" % jettyVersion % "container",
        "org.eclipse.jetty" % "jetty-websocket" % jettyVersion % "container;provided",
        "org.eclipse.jetty" % "jetty-jsp" % jettyVersion % "container",
        "org.eclipse.jetty.orbit" % "javax.servlet" % "3.0.0.v201112011016" % "container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
      ),
      scalateTemplateConfig in Compile <<= (sourceDirectory in Compile){ base =>
        Seq(
          TemplateConfig(
            base / "webapp" / "WEB-INF" / "templates",
            Seq.empty, /* default imports should be added here */
            Seq.empty, /* add extra bindings here */
            Some("templates")
          )
        )
      }
    )
  )

  publishArtifact in (Compile, packageBin) := true

  publishArtifact in (Test, packageBin) := false

  publishArtifact in (Compile, packageDoc) := false

  publishArtifact in (Compile, packageSrc) := true
}
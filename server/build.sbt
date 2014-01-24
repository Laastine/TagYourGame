name := "server"

version := "1.0"

scalaVersion:="2.11.0"

scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8", "-feature")

resolvers ++= Seq(
  "typesafe repo" at "http://repo.typesafe.com/typesafe/releases/",
  "spray" at "http://repo.spray.io",
  "spray nightly" at "http://nightlies.spray.io/"
)

libraryDependencies ++= Seq(
  "io.spray" % "spray-can" % "1.2-RC3",
  "com.typesafe.akka" %% "akka-actor" % "2.2.3",
  "com.typesafe.akka" %% "akka-testkit" % "2.2.3" % "test",
  "org.scalatest" % "scalatest_2.10" % "2.0" % "test"
)

    
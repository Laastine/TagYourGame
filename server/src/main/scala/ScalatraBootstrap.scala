import org.fgj._
import org.scalatra._
import javax.servlet.ServletContext

/**
 * server
 * Created with IntelliJ IDEA.
 * User: laastine
 * Date: 25.01.2014
 */
class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new ServerController, "/*")
  }
}

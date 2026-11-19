/**
 * dsh-whale-pet —— Host 半
 *
 * 桌宠完全活在浏览器侧，Host 半没有任何行为。
 * 这个空的 apply 存在的唯一目的，是让本插件出现在 Host 的 Loader 行里；
 * 浏览器半通过 exports["./client"] 发布，由 package.json 的 dsh.client 声明被发现。
 */

/** Host 插件体：桌宠无 Host 侧行为。 */
function apply() {}

export { apply };
